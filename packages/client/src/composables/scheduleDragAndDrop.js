import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import _ from 'lodash';

import { timeBlocksApi } from '@/api';
import { useTimeBlockPlacing } from '@/composables';
import { useGeneral, useConstants } from '@/util';

const doUpdateApiCall = (id, { day, start, duration, week }) => {
  const data = {};
  day !== undefined && (data.day = day);
  start !== undefined && (data.start = start);
  duration !== undefined && (data.duration = duration);
  week !== undefined && (data.week = week === 'general' ? null : week);
  return _.isEmpty(data) ? Promise.resolve() : timeBlocksApi.update(id, data);
};

export default (placed, unplaced) => {
  const $q = useQuasar();
  const { stop, prevent, stopPrevent } = useGeneral();
  const { timeBlockShakeAnimation, draggingCursor } = useConstants();
  const placedTimeBlocks = ref(placed);
  const unplacedTimeBlocks = ref(unplaced);
  const placing = ref(false);
  const moving = ref(false);
  const dragging = computed(() => placing.value || moving.value);
  const { doPlace, doUnplace, doMove } = useTimeBlockPlacing(placedTimeBlocks, unplacedTimeBlocks);

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

  const onDragStart = (event, id, weekDay = -1, action = 'place') => {
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('action', action);
    event.dataTransfer.setData('id', id);
    event.dataTransfer.setData('weekDay', weekDay);

    setTimeout(async () => {
      if (action === 'place') {
        placing.value = true;
      } else {
        moving.value = true;
      }
      //await doShakeAnimation(event.target);
      event.target.style.display = 'none';
    }, 0);

    stop(event);
  };

  const onDragEnd = event => {
    event.target.style.display = 'block';
    //doShakeAnimation(event.target);
    placing.value = false;
    moving.value = false;
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
    { droppable, timestamp: { weekday: newWeekDay, time: newStart } },
    newWeek
  ) => {
    prevent(event);

    if (!droppable) {
      return;
    }

    const action = event.dataTransfer.getData('action');
    const id = +event.dataTransfer.getData('id');
    const weekDay = +event.dataTransfer.getData('weekDay');

    try {
      if (action === 'place') {
        doPlace(id, newWeekDay - 1, newStart, newWeek);

        try {
          await doUpdateApiCall(id, { day: newWeekDay - 1, start: newStart, week: newWeek });
        } catch (e) {
          doUnplace(id, newWeekDay - 1);
          throw e;
        }
      } else {
        const oldData = doMove(id, weekDay, newWeekDay - 1, newStart, newWeek);

        try {
          await doUpdateApiCall(id, { day: newWeekDay - 1, start: newStart, week: newWeek });
        } catch (e) {
          doUnplace(id, newWeekDay - 1);
          doPlace(id, weekDay, oldData.start, oldData.week);
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

    const oldData = doUnplace(id, weekDay);
    try {
      await doUpdateApiCall(id, { day: null, start: null, week: null });
    } catch (e) {
      doPlace(id, weekDay, oldData.start, oldData.week);

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
    placedTimeBlocks,
    unplacedTimeBlocks,
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
