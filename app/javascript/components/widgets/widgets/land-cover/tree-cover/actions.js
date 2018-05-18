import { getExtent } from 'services/forest-data';

export const getData = ({ params, dispatch, setWidgetData, widget }) => {
  getExtent(params)
    .then(response => {
      const extent = response.data && response.data.data;
      let totalArea = 0;
      let cover = 0;
      let plantations = 0;
      let data = {};
      if (extent.length) {
        totalArea = extent[0].total_area;
        cover = extent[0].value;
        data = {
          totalArea,
          cover,
          plantations
        };
      }
      if (params.indicator) {
        dispatch(setWidgetData({ data, widget }));
      } else {
        getExtent({ ...params, forestType: 'plantations' }).then(
          plantationsResponse => {
            const plantationsData =
              plantationsResponse.data && plantationsResponse.data.data;
            plantations = plantationsData.length ? plantationsData[0].value : 0;
            if (extent.length) {
              data = {
                ...data,
                plantations
              };
            }
            dispatch(setWidgetData({ data, widget }));
          }
        );
      }
    })
    .catch(error => {
      dispatch(setWidgetData({ widget, error: true }));
      console.info(error);
    });
};

export default {
  getData
};
