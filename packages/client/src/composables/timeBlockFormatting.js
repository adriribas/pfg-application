import { ref, watch } from 'vue';
import _ from 'lodash';

import { useConstants, useCalendar } from '@/util';

export default (timeBlock, width, height) => {
  const { groupTypeLabels, timeBlocksSizeLevels } = useConstants();
  const { isGeneric } = useCalendar();

  const isWide = ref(false);
  const area = ref(0);
  const sizeLevel = ref(0);
  const label = ref('');
  const subLabel = ref('');

  const timeBlockLabelFormatters = (timeBlock, width, isWide) => [
    () => {
      const subject = timeBlock.subject;
      return subject.name.split(' ').some(word => word.length * 6.5 > width) ? subject.abv : subject.name;
    },
    () =>
      timeBlock.subject.abv
        .split(' ')
        .map(word => (word.split('').some(char => char !== 'I') ? word : word.length))
        .join('')
        .replaceAll('.', ''),
    () => timeBlock.subject.abv
  ];
  const timeBlockSubLabelFormatters = (timeBlock, width, isWide) => [
    () => `Grup ${groupTypeLabels[timeBlock.group.type]} ${timeBlock.group.number}`,
    () => `${groupTypeLabels[timeBlock.group.type][0]}${timeBlock.group.number}`,
    () =>
      `${isWide ? `G. ${groupTypeLabels[timeBlock.group.type]} ` : groupTypeLabels[timeBlock.group.type][0]}${
        timeBlock.group.number
      }`
  ];

  const genericTimeBlockLabelFormatters = (timeBlock, width, isWide) => [
    () =>
      timeBlock[timeBlock.label.split(' ').some(word => word.length * 6.5 > width) ? 'labelAbv' : 'label'],
    () =>
      timeBlock.labelAbv
        .split(' ')
        .map(word => (word.split('').some(char => char !== 'I') ? word : word.length))
        .join('')
        .replaceAll('.', ''),
    () => timeBlock.labelAbv
  ];
  const genericTimeBlockSubLabelFormatters = (timeBlock, width, isWide) =>
    Array(3).fill(() => timeBlock.subLabel);

  const updateValues = () => {
    isWide.value = width.value - height.value > 100;
    area.value = width.value * height.value;
    sizeLevel.value = timeBlocksSizeLevels.findIndex(max => _.inRange(area.value, null, max)) + 1;
    label.value = (isGeneric(timeBlock.value) ? genericTimeBlockLabelFormatters : timeBlockLabelFormatters)(
      timeBlock.value,
      width.value,
      isWide.value
    )[sizeLevel.value]();
    subLabel.value = (
      isGeneric(timeBlock.value) ? genericTimeBlockSubLabelFormatters : timeBlockSubLabelFormatters
    )(timeBlock.value, width.value, isWide.value)[sizeLevel.value]();
  };

  updateValues();
  watch(timeBlock, updateValues);
  watch(width, updateValues);
  watch(height, updateValues);

  return { sizeLevel, label, subLabel };
};
