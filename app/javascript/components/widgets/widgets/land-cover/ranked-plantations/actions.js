import {
  getMultiRegionExtent,
  getPlantationsExtent
} from 'services/forest-data';
import axios from 'axios';

export const getData = ({ params, dispatch, setWidgetData, widget }) => {
  axios
    .all([
      getMultiRegionExtent(params),
      getPlantationsExtent({ ...params, groupByRegion: true })
    ])
    .then(
      axios.spread((multiRegionExtentResponse, plantationsExtentResponse) => {
        let data = {};
        const extent =
          multiRegionExtentResponse.data && multiRegionExtentResponse.data.data;
        const plantationsExtent =
          plantationsExtentResponse.data && plantationsExtentResponse.data.data;
        if (extent.length && plantationsExtent.length) {
          data = {
            extent,
            plantations: plantationsExtent
          };
        }
        dispatch(setWidgetData({ data, widget }));
      })
    )
    .catch(error => {
      dispatch(setWidgetData({ widget, error: true }));
      console.info(error);
    });
};

export default {
  getData
};
