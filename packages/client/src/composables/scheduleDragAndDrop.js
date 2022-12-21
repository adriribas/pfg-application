import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { useTimeBlocksStore, useOverlappingStore } from '@/stores';
import { timeBlocksApi, genericTimeBlocksApi } from '@/api';
import { useConstants, useCalendar, useGeneral } from '@/util';

const doUpdateApiCall = (isGeneric, id, { day, start, duration, week }) => {
  const data = {};

  day !== undefined && (data.day = day);
  start !== undefined && (data.start = start);
  duration !== undefined && (data.duration = duration);
  week !== undefined && (data.week = week === 'general' ? null : week);

  return _.isEmpty(data)
    ? Promise.resolve()
    : (isGeneric ? genericTimeBlocksApi : timeBlocksApi).update(id, data);
};

export default () => {
  const $q = useQuasar();
  const timeBlocksStore = useTimeBlocksStore();
  const overlappingStore = useOverlappingStore();
  const { timeBlockShakeAnimation, draggingCursor } = useConstants();
  const { timeToMinutes, minutesToTime, getMaxPlaceableTime } = useCalendar();
  const { stop, prevent, stopPrevent } = useGeneral();
  const placing = ref(null);
  const moving = ref(null);
  const dragging = computed(() => placing.value || moving.value);

  const doShakeAnimation = elem =>
    new Promise(res => {
      if (!elem) {
        return res();
      }

      elem.addEventListener('animationend', () => {
        elem.style.animationName = null;
        res();
      });
      elem.style.animationName = timeBlockShakeAnimation;
    });

  const onDragStart = (event, timeBlock, isGeneric, weekDay = -1, action = 'place') => {
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('action', action);
    event.dataTransfer.setData('id', timeBlock.id);
    event.dataTransfer.setData('weekDay', weekDay);
    event.dataTransfer.setData('duration', timeBlock.duration);
    event.dataTransfer.setData('isGeneric', +isGeneric);

    setTimeout(async () => {
      if (action === 'place') {
        placing.value = timeBlock;
      } else {
        moving.value = timeBlock;
      }
      if (timeBlock.group?.type === 'small') {
        overlappingStore.setSelectedLabTypes(timeBlock.subject.labTypes);
      }
      //await doShakeAnimation(event.target);
      event.target.style.display = 'none';
    }, 0);

    stop(event);
  };

  const onDragEnd = event => {
    event.target.style.display = 'block';
    //doShakeAnimation(event.target);
    placing.value = null;
    moving.value = null;
    overlappingStore.clear();
  };

  const onDragEnter = (event, type) => {
    prevent(event);

    return type === 'interval';
  };

  const onDragOver = (event, type) => {
    prevent(event);

    return type === 'interval';
  };

  const onDragLeave = event => stopPrevent(event);

  const onDropCalendar = async (
    event,
    _type,
    { droppable, timestamp: { weekday: newWeekDay, time } },
    newWeek
  ) => {
    prevent(event);

    if (!droppable) {
      return;
    }

    const action = event.dataTransfer.getData('action');
    const id = +event.dataTransfer.getData('id');
    const weekDay = +event.dataTransfer.getData('weekDay');
    const duration = +event.dataTransfer.getData('duration');
    const isGeneric = +event.dataTransfer.getData('isGeneric');

    const maxPlaceableMinutes = timeToMinutes(getMaxPlaceableTime());
    const newStart =
      timeToMinutes(time) + duration <= maxPlaceableMinutes
        ? time
        : minutesToTime(maxPlaceableMinutes - duration);

    try {
      if (action === 'place') {
        timeBlocksStore.place(id, newWeekDay - 1, newStart, newWeek);

        try {
          await doUpdateApiCall(isGeneric, id, { day: newWeekDay - 1, start: newStart, week: newWeek });
        } catch (e) {
          timeBlocksStore.unplace(id, newWeekDay - 1);
          throw e;
        }
      } else {
        const oldData = timeBlocksStore.move(id, weekDay, newWeekDay - 1, newStart, newWeek);

        try {
          await doUpdateApiCall(isGeneric, id, { day: newWeekDay - 1, start: newStart, week: newWeek });
        } catch (e) {
          timeBlocksStore.move(id, newWeekDay - 1, weekDay, oldData.start, oldData.duration);
          throw e;
        }
      }
    } catch (e) {
      console.error(e);
      $q.notify({
        type: 'error',
        message: action === 'move' ? 'Error al moure el bloc horari' : 'Error al col·locar el bloc horari',
        caption: e.message
      });
    }
  };

  const onDropUnplacedZone = async event => {
    if (event.dataTransfer.getData('action') !== 'move') {
      return;
    }

    const id = +event.dataTransfer.getData('id');
    const weekDay = +event.dataTransfer.getData('weekDay');
    const isGeneric = +event.dataTransfer.getData('isGeneric');

    const oldData = timeBlocksStore.unplace(id, weekDay);
    try {
      await doUpdateApiCall(isGeneric, id, { day: null, start: null, week: null });
    } catch (e) {
      timeBlocksStore.place(id, weekDay, oldData.start, oldData.week);

      console.error(e);
      $q.notify({
        type: 'error',
        message: 'Error al treure el bloc horari',
        caption: e.message
      });
    }
  };

  watch(dragging, newDragging => {
    const classList = document.getElementsByTagName('html').item(0).classList;

    if (newDragging) {
      classList.add(draggingCursor);
    } else {
      classList.remove(draggingCursor);
    }
  });

  return {
    placing,
    moving,
    dragging,
    doShakeAnimation,
    onDragStart,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDropCalendar,
    onDropUnplacedZone
  };
};
