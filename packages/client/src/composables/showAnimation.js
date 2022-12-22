import { onMounted } from 'vue';

import { useEventListener } from '.';

export default targetRef => {
  useEventListener(
    targetRef.value,
    'animationend',
    () => (targetRef.value.style.animationPlayState = 'paused')
  );

  onMounted(() => (targetRef.value.animationPlayState = 'running'));
};
