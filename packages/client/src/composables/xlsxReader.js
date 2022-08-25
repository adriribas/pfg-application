import { ref, isRef, unref, watchEffect } from 'vue';

import { read } from 'xlsx';

export const useXlsxReader = file => {
  const data = ref(null);
  const error = ref('');

  const doRead = async () => {
    data.value = null;
    try {
      const workbook = read(await unref(file).arrayBuffer());
      data.value = workbook;
    } catch (e) {
      console.error('Error reading file', e);
      error.value = e.message;
    }
  };

  if (isRef(file)) {
    watchEffect(doRead);
  } else {
    doRead();
  }

  return { data, error };
};
