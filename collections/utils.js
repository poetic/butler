Utils = {
  startOf(interval) {
    return moment().startOf(interval).toDate();
  },

  endOf(interval) {
    return moment().endOf(interval).toDate();
  },
};
