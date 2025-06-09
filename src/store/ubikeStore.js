import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useUbikeStore = defineStore("ubike", () => {
  // 獲取縣市與行政區的部分
  const currCity = ref("");
  const currDistrict = ref("");
  const locationData = ref([]);
  const cityToDistrictMap = ref({}); // 程式啟動時，藉由locationRes的API內容推算出「縣市→行政區」對照表

  async function fetchLocation() {
    const locationRes = await fetch(
      "https://raw.githubusercontent.com/kurotanshi/mask-map/master/raw/area-location.json"
    );
    locationData.value = await locationRes.json();

    // 建立一個「城市→行政區」的映射表
    const map = {};
    for (const city of locationData.value) {
      const cityName = city.name;
      const districtNames = city.districts.map((d) => d.name);
      map[cityName] = districtNames;
    }
    cityToDistrictMap.value = map;
  }

  const cityList = computed(() => Object.keys(cityToDistrictMap.value));
  const districtList = computed(() => cityToDistrictMap.value[currCity.value]);

  // 獲取ubike站的部分
  const allStations = ref([]); // 儲存全部ubike站點資料

  async function fetchAllStation() {
    const urls = {
      臺北市:
        "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json",
      // 新北市:
      //   "https://data.ntpc.gov.tw/api/datasets/010E5B15-3823-4B20-B401-B1CF000550C5/json?page=0&size=1000",
      // 臺中市:
      //   "https://datacenter.taichung.gov.tw/swagger/OpenData/b87c286d-0dce-4094-b34d-6935f3813539",
      // 高雄市:
      //   "https://api.kcg.gov.tw/api/service/Get/b4dd9c40-9027-4125-8666-06bef1756092",
    };

    const fetches = Object.entries(urls).map(async ([city, url]) => {
      // const proxy = "https://cors-anywhere.herokuapp.com/"; // 這些proxy只是開發測試用，不能放到正式網站，因為這些公開proxy都不可靠
      // const res = await fetch(proxy + url);
      const res = await fetch(url);
      // if (!res.ok) {
      //   console.warn(`⚠️ ${city} API 回傳非 200：`, res.status);
      //   return []; // 回傳空陣列，不讓它中斷
      // }

      const raw = await res.json();

      // 將不同城市的資料轉為統一格式（以臺北市資料的key值為準）
      return raw.map((item) => {
        if (city === "臺北市") {
          return {
            city,
            ...item, // 保留原本的其他屬性
            sna: item.sna.replace("YouBike2.0_", ""),
            snaen: item.snaen.replace("YouBike2.0_", ""),
          };
        } else if (city === "新北市") {
          return {
            city,
            ...item,
            sna: item.sna.replace("YouBike2.0_", ""),
            snaen: item.snaen.replace("YouBike2.0_", ""),
            mday: `${item.mday.slice(0, 4)}-${item.mday.slice(
              4,
              6
            )}-${item.mday.slice(6, 8)} ${item.mday.slice(
              8,
              10
            )}:${item.mday.slice(10, 12)}:${item.mday.slice(12, 14)}`,
            total: item.tot,
            available_rent_bikes: item.sbi,
            available_return_bikes: item.bemp,
            longitude: parseFloat(item.lat),
            latitude: parseFloat(item.lng),
          };
        } else if (city === "臺中市") {
          return {
            city,
            ...item,
            sna: item.sna.replace("YouBike2.0_", ""),
            snaen: item.snaen.replace("YouBike2.0_", ""),
            mday: `${item.mday.slice(0, 4)}-${item.mday.slice(
              4,
              6
            )}-${item.mday.slice(6, 8)} ${item.mday.slice(
              8,
              10
            )}:${item.mday.slice(10, 12)}:${item.mday.slice(12, 14)}`,
            total: item.tot,
            available_rent_bikes: item.sbi,
            available_return_bikes: item.bemp,
            longitude: parseFloat(item.lat),
            latitude: parseFloat(item.lng),
          };
        } else if (city === "高雄市") {
          return {
            city,
            ...item,
            sna: item.sna.replace("YouBike2.0_", ""),
            snaen: item.snaen.replace("YouBike2.0_", ""),
            mday: `${item.mday.slice(0, 4)}-${item.mday.slice(
              4,
              6
            )}-${item.mday.slice(6, 8)} ${item.mday.slice(
              8,
              10
            )}:${item.mday.slice(10, 12)}:${item.mday.slice(12, 14)}`,
            total: item.tot,
            available_rent_bikes: item.sbi,
            available_return_bikes: item.bemp,
            longitude: parseFloat(item.lat),
            latitude: parseFloat(item.lng),
          };
        }
      });
    });

    const results = await Promise.all(fetches);
    allStations.value = results.flat();
  }

  // 關鍵字搜尋的部分
  const keyword = ref(""); // 關鍵字

  const stationList = computed(() => {
    // 下面用filter過濾出符合的站點，放在stationList中
    return allStations.value.filter((d) => {
      // 如果沒有輸入關鍵字，就直接通過（true）
      // 如果有關鍵字，就要比對站點名稱（sna）或地址（ar）是否有包含關鍵字
      const matchKeyword =
        !keyword.value.trim() || // 沒輸入 → true
        d.sna.includes(keyword.value) || // 有輸入 → 比對站名
        d.ar.includes(keyword.value); // 或比對地址

      // 如果沒有選城市，就不過濾（true）
      // 如果有選城市，就比對站點的城市欄位（city）
      const matchCity =
        !currCity.value ||
        cityToDistrictMap.value[currCity.value]?.includes(d.sarea);

      // 如果沒有選行政區，就不過濾（true）
      // 如果有選行政區，就比對站點的行政區（sarea）
      const matchDistrict =
        !currDistrict.value || d.sarea === currDistrict.value;

      // 三個條件都通過，這個站點才會出現在stationList裡
      return matchKeyword && matchDistrict && matchCity;
    });
  });

  // LightBox的部分
  const lightboxVisible = ref(false); // 判斷btn是否有被按到
  const selectedStation = ref(null); // 儲存被按到btn的站點資訊

  return {
    currCity,
    currDistrict,
    locationData,
    cityToDistrictMap,
    cityList,
    districtList,
    fetchLocation,
    fetchAllStation,
    keyword,
    stationList,
    lightboxVisible,
    selectedStation,
  };
});
