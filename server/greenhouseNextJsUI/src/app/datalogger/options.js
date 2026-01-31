export default {
  title: 'Senscap Data Logger',
  axes: {
    left: {
      mapsTo: 'value',
    },
    bottom: {
      scaleType: 'time',
      mapsTo: 'date',
    },
  },
  legend: {
    clickable: false,
  },
  height: '400px',
  width: '1000px',
};
