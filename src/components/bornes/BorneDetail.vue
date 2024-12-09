<template>
  <div class="flex flex-1 flex-col">
    <div class="flex flex-1 flex-row justify-between items-center">
      <Button
        type="button"
        label="Retour à la liste"
        @click="router.push({ name: 'BorneTracking' })"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </template>
      </Button>
      <div class="header">Détail de la borne</div>
      <Button
        type="button"
        severity="danger"
        label="Supprimer"
        @click="deleteBorneButton"
      >
        <template #icon>
          <font-awesome-icon :icon="['fas', 'trash']" />
        </template>
      </Button>
    </div>
    <div class="view-content2">
      <div class="intro">
        <div class="info-borne">
          <div class="col1" v-if="borne">
            <div class="titre">
              <p>Nom :</p>
              <h3>{{ borne.name }}</h3>
            </div>
            <div class="info">
              <p>Status :</p>
              <h3>{{ borne.status }}</h3>
            </div>
            <div class="info">
              <p>Location :</p>
              <h3>{{ borne.location }}</h3>
            </div>
            <div class="info">
              <p>Type:</p>
              <h3>{{ borne.type }}</h3>
            </div>
            <div class="info">
              <p>Manufacturer :</p>
              <h3>{{ borne.manufacturer }}</h3>
            </div>
          </div>
        </div>

        <div class="Live-stats">
          <div class="small-chart">
            <canvas class="smallChart" id="smallChart"></canvas>
          </div>
        </div>
      </div>

      <div class="borne-tabs">
        <div class="tabs-header">
          <div
            class="tab-header"
            :class="{ 'tab-selected': selectedTab === 'actions' }"
            @click="selectedTab = 'actions'"
          >
            Actions à distance
          </div>
          <div
            class="tab-header"
            :class="{ 'tab-selected': selectedTab === 'history' }"
            @click="selectedTab = 'history'"
          >
            Historique
          </div>
          <div
            class="tab-header"
            :class="{ 'tab-selected': selectedTab === 'statistics' }"
            @click="selectedTab = 'statistics'"
          >
            Statistiques
          </div>
        </div>
        <div v-if="selectedTab === 'actions'">
          <div class="history">
            <p>Actions à distance</p>
          </div>
        </div>
          <div v-if="selectedTab === 'history'">
            <DataTable
              stripedRows
              :value="equipmentHistory"
              dataKey="time"
              :loading="isLoading"
              scrollable
              scrollHeight="520px"
              tableStyle="min-width: 50rem"
              :sortField="'time'"
              :sortOrder="-1"
              class="sticky-table"
            >
              <Column sortable field="time" header="Time">
                <template #body="{ data }">
                  {{ format(new Date(data.time), 'PPpp') }}
                </template>
              </Column>
              <Column sortable field="voltage" header="Voltage (V)"></Column>
              <Column sortable field="wattage" header="Wattage (W)"></Column>
            </DataTable>
          </div>
        <div class="tab" v-if="selectedTab === 'statistics'">
          <div class="chart-tab flex-1 h-full">
            <div class="chart">
              <canvas id="historyChart"></canvas>
            </div>
            <div>
              <select v-model="timeRange" class="selector">
                <option value="1m">Minutes</option>
                <option value="1h">Hour</option>
                <option value="1d">Day</option>
                <option value="7d">Week</option>
                <option value="30d">Month</option>
                <option value="365d">Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBorneDetails } from '@/composables/borne.js';
import { deleteBornes } from '@/composables/borne.js';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import _ from 'lodash';
import Button from 'primevue/button';

import { useBorneManagementStore } from '@/stores/borneManagement.js';
import { useBornesList } from '@/composables/borne.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
const route = useRoute();
const router = useRouter();
const borneManagementStore = useBorneManagementStore();

const borneId = computed(() => route.params.equipment_id);

const { fetchBornes } = useBornesList();

const borne = ref(null);
const {
  eventSource,
  isLoading,
  error,
  fetchBorneDetails,
  fetchEquipmentHistory,
} = useBorneDetails(parseMqttMessage);

const { deleteBorne } = deleteBornes();

const timeRange = ref('1h');
const chart = ref(null);
const smallChart = ref(null);
let deviceSensor = ref({});
let equipmentHistory = ref([]);
let selectedTab = ref('Historique');

async function deleteBorneButton() {
  await deleteBorne(borne.value.equipment_id);

  router.push({ name: 'BorneTracking' });
}

function parseMqttMessage(message) {
  try {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.StatusSNS && parsedMessage.StatusSNS.ENERGY) {
      deviceSensor.value.Total = parsedMessage.StatusSNS.ENERGY.Total;
      deviceSensor.value.Power = parsedMessage.StatusSNS.ENERGY.Power;
      deviceSensor.value.Voltage = parsedMessage.StatusSNS.ENERGY.Voltage;
      deviceSensor.value.Current = parsedMessage.StatusSNS.ENERGY.Current;
      deviceSensor.value.Today = parsedMessage.StatusSNS.ENERGY.Today;
      deviceSensor.value.Yesterday = parsedMessage.StatusSNS.ENERGY.Yesterday;
    }
    console.log(deviceSensor);
  } catch (error) {
    console.error('Error parsing message ' + message, error);
  }
}

async function loadEquipmentHistory() {
  const [success, history, error] = await fetchEquipmentHistory(
    borne.value.equipment_id,
    '365d',
  );

  if (!success) {
    console.error('Failed to fetch equipment history:', error);
  }
  equipmentHistory.value = history !== null ? history.data : null;
  if (selectedTab.value === 'statistics') {
    createChart();
  }
  createSmallChart();
}

function createSmallChart() {
  if (smallChart.value) {
    smallChart.value.destroy();
  }
  const ctx = document.getElementById('smallChart').getContext('2d');
  const labels =
    equipmentHistory.value !== null
      ? equipmentHistory.value.map((reading) => reading.time)
      : [];

  const data =
    equipmentHistory.value !== null
      ? {
          labels: labels,
          datasets: [
            {
              label: 'Voltage (V)',
              data: equipmentHistory.value.map((reading) => reading.voltage),
              borderColor: 'rgba(60, 179, 113, 1)',
              backgroundColor: 'rgba(60, 179, 113, 0.2)',
            },
            {
              label: 'Wattage (W)',
              data: equipmentHistory.value.map((reading) => reading.wattage),
              borderColor: 'rgba(255, 0, 0, 1)',
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
            },
          ],
        }
      : {
          labels: [],
          datasets: [
            {
              label: 'Voltage (V)',
              data: [],
              borderColor: 'rgba(60, 179, 113, 1)',
              backgroundColor: 'rgba(60, 179, 113, 0.2)',
            },
            {
              label: 'Wattage (W)',
              data: [],
              borderColor: 'rgba(255, 0, 0, 1)',
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
            },
          ],
        };
  const now = new Date();
  let minDate = new Date();
  minDate.setMinutes(now.getMinutes() - 5);

  smallChart.value = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
          },
          min: minDate,
          max: now,
          ticks: {
            source: 'auto',
            autoSkip: true,
            maxTicksLimit: 12,
          },
        },
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function createChart() {
  if (chart.value) {
    chart.value.destroy();
  }
  const ctx = document.getElementById('historyChart').getContext('2d');
  const labels =
    equipmentHistory.value !== null
      ? equipmentHistory.value.map((reading) => reading.time)
      : [];
  const hasData = equipmentHistory.value && equipmentHistory.value.length > 0;
  // const aggregatedData = aggregateData(equipmentHistory.value, timeRange.value);

  const data =
    equipmentHistory.value !== null
      ? {
          labels: labels,
          datasets: [
            {
              label: 'Voltage (V)',
              data: equipmentHistory.value.map((reading) => reading.voltage),
              borderColor: 'rgba(60, 179, 113, 1)',
              backgroundColor: 'rgba(60, 179, 113, 0.2)',
            },
            {
              label: 'Wattage (W)',
              data: equipmentHistory.value.map((reading) => reading.wattage),
              borderColor: 'rgba(255, 0, 0, 1)',
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
            },
          ],
        }
      : {
          labels: [],
          datasets: [
            {
              label: 'Voltage (V)',
              data: [],
              borderColor: 'rgba(60, 179, 113, 1)',
              backgroundColor: 'rgba(60, 179, 113, 0.2)',
            },
            {
              label: 'Wattage (W)',
              data: [],
              borderColor: 'rgba(255, 0, 0, 1)',
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
            },
          ],
        };
  const now = new Date();
  let minDate = new Date();
  switch (timeRange.value) {
    case '1d':
      minDate.setDate(now.getDate() - 1);
      break;
    case '7d':
      minDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      minDate.setDate(now.getDate() - 30);
      break;
    case '365d':
      minDate.setFullYear(now.getFullYear() - 1);
      break;
    case '1h':
      minDate.setHours(now.getHours() - 1);
      break;
    case '1m':
      minDate.setMinutes(now.getMinutes() - 10);
      break;
  }

  chart.value = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit:
              timeRange.value === '1m'
                ? 'minute'
                : timeRange.value === '1h'
                  ? 'hour'
                  : 'day',
          },
          min: minDate,
          max: now,
          ticks: {
            source: 'auto',
            autoSkip: true,
            maxTicksLimit: 12,
          },
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        noData: {
          beforeDraw(chart) {
            if (!hasData) {
              const {
                ctx,
                chartArea: { left, top, width, height },
              } = chart;
              ctx.save();

              ctx.font = 'bold 20px Arial';
              ctx.fillStyle = 'black';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              ctx.fillText('NO DATA', left + width / 2, top + height / 2);

              ctx.restore();
            }
          },
        },
      },
    },
    plugins: [
      {
        id: 'noData',
      },
    ],
  });
}
// function aggregateData(data, timeRange) {
//   if (!data || data.length === 0) return [];

//   const interval = getAggregationInterval(timeRange);
//   const groupedData = _.groupBy(data, (reading) => {
//     return Math.floor(new Date(reading.time).getTime() / interval) * interval;
//   });

//   return Object.keys(groupedData).map((key) => {
//     const group = groupedData[key];
//     const avgVoltage = _.meanBy(group, 'voltage');
//     const avgWattage = _.meanBy(group, 'wattage');
//     return {
//       time: new Date(parseInt(key)),
//       voltage: avgVoltage,
//       wattage: avgWattage,
//     };
//   });
// }

// function getAggregationInterval(timeRange) {
//   switch (timeRange) {
//     case '1m':
//       return 60 * 1000; // 1 minute
//     case '1h':
//       return 60 * 60 * 1000; // 1 hour
//     case '1d':
//       return 24 * 60 * 60 * 1000; // 1 day
//     case '7d':
//       return 7 * 24 * 60 * 60 * 1000; // 1 week
//     case '30d':
//       return 30 * 24 * 60 * 60 * 1000; // 1 month
//     case '365d':
//       return 365 * 24 * 60 * 60 * 1000; // 1 year
//     default:
//       return 10 * 1000; // Default to 10 seconds
//   }
// }
watch(selectedTab, async (newTab) => {
  if (newTab === 'statistics') {
    await nextTick();
    try {
      createChart();
    } catch (error) {
      console.error('Failed to create chart:', error);
    }
  }
});
watch(timeRange, async () => {
  if (selectedTab.value === 'statistics') {
    await nextTick();
    try {
      createChart();
    } catch (error) {
      console.error('Failed to create chart:', error);
    }
  }
});

watch(borne, async () => {
  if (borne.value) {
    await loadEquipmentHistory();
  }
});

async function loadBorne() {
  if (borneManagementStore.bornes.length === 0) {
    console.log('No borne found');
    await fetchBornes();
  }
  borne.value = borneManagementStore.bornes.find(
    (borne) => borne.equipment_id === borneId.value,
  );
}

onMounted(() => {
  loadBorne();
  // fetchBorneDetails(borne.value.mqtt_topic);
  // loadEquipmentHistory();
});
onUnmounted(() => {
  // eventSource.value.close();
  console.log('Event source closed');
});
</script>

<style scoped>
.history {
  margin-top: 20px;
  display: flex;
  justify-content: center; /* Center the table horizontally */
  width: 100%;
}

table {
  width: 80%; /* Set the table width to 80% of its container */
  border-collapse: collapse;
  margin: 0 auto; /* Center the table */
  background-color: white;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
}

th {
  background-color: #f2f2f2;
  text-align: left;
}

canvas {
  margin-top: 20px;
}
.chart-tab {
  display: flex;
  align-items: center;
}
.chart {
  display: flex;
  width: 100%;
  height: 100%;
}


.sticky-table :deep(.p-datatable-thead) {
  position: sticky;
  top: 0;
  background-color: #f8f9fa; /* Background color to cover content behind */
  z-index: 2;
}

.sticky-table :deep(.p-paginator) {
  position: sticky;
  bottom: 0;
  background-color: #fff; /* Background color to cover content behind */
  z-index: 2;
  border-top: 1px solid #ddd;
}

.borne-tabs {
  display: flex;
  height: 600px;
  flex-direction: column;
  /* align-items: center; */
  align-items: stretch;
  align-self: stretch;
  border-radius: var(--global-spacing-spacing-default, 16px);
  box-shadow: 0px 0px var(--global-blurs-blur-xl, 18px) 0px rgba(0, 0, 0, 0.16);
}

.tabs-header {
  display: flex;
  align-items: flex-start;
  gap: 1px;
  align-self: stretch;
  border-bottom: 1px solid var(--border-border-color-default, #e7e9ed);
  background: #fff;
}
.tab {
  display: flex;
  padding: var(--global-spacing-spacing-default, 16px)
    var(--global-spacing-spacing-xxl, 30px);
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  cursor: pointer;
}

.selector {
  padding: var(--global-spacing-spacing-default, 16px)
    var(--global-spacing-spacing-xxl, 30px);
  border: none;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: -0.32px;
  color: var(--text-text-color-base, #121418);
  border-radius: var(--global-spacing-spacing-default, 16px);
}

.tab-selected {
  display: flex;
  padding: var(--global-spacing-spacing-default, 16px)
    var(--global-spacing-spacing-xxl, 30px);
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  border-bottom: 5px solid #2d2e83;
  background: #dddef3;
}

.tab-header {
  display: flex;
  padding: var(--global-spacing-spacing-default, 16px)
    var(--global-spacing-spacing-xxl, 30px);
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  cursor: pointer;
  border-right: 1px solid var(--border-border-color-default, #e7e9ed);
  border-left: 1px solid var(--border-border-color-default, #e7e9ed);
}

.view-content2 {
  display: flex;
  padding-top: var(--global-spacing-spacing-default, 16px);
  flex-direction: column;
  align-items: flex-start;
  gap: var(--global-spacing-spacing-lg, 24px);
  flex: 1 0 0;
  align-self: stretch;
}

.intro {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--global-spacing-spacing-lg, 24px);
  align-self: stretch;
}

.info-borne {
  display: flex;
  padding: var(--global-spacing-spacing-default, 16px)
    var(--global-spacing-spacing-lg, 24px);
  justify-content: space-between;
  align-items: flex-start;
  flex: 1 0 0;
  border-radius: var(--global-spacing-spacing-default, 16px);
  background: linear-gradient(271deg, #2d2e83 29.63%, #4143be 90.43%);
}

.col1 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: var(--global-spacing-spacing-default, 16px);
  align-self: stretch;
}

.titre {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.titre h3 {
  color: var(--palettes-white-white, #fff);
  font-size: 34px;
  font-style: normal;
  font-weight: 700;
  letter-spacing: -0.68px;
  margin: 0px;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 12px;
}

p {
  color: var(--palettes-white-white-80, rgba(255, 255, 255, 0.8));
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  margin: 0px;
}

.info h3 {
  color: var(--palettes-white-white, #fff);
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  letter-spacing: -0.32px;
  margin: 0px;
  border-radius: var(--forms-metrics-form-radius, 8px);
}

.delete {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: var(--global-spacing-spacing-default, 16px);
  align-self: stretch;
  cursor: pointer;
  border-radius: var(--buttons-metrics-button-radius, 8px);
  border: var(--buttons-metrics-button-stroke-size, 1px) solid
    var(--buttons-colors-button-error, #f04438);
  color: var(--buttons-colors-button-error, #f04438);
  margin-left: auto;
}

.delete:hover {
  background: var(--buttons-colors-button-error-hover, #ef685f95);
  color: white;
}

.delete:active {
  background: var(--buttons-colors-button-error-active, #d13a2f);
}

.view-content {
  display: flex;
  padding: var(--global-spacing-spacing-lg, 24px)
    var(--global-spacing-spacing-xl, 28px)
    var(--global-spacing-spacing-lg, 24px) var(--global-radius-radius-xl, 24px);
  flex-direction: column;
  align-items: flex-start;
  flex: 1 0 0;
  align-self: stretch;
}

.back-button {
  border-radius: var(--buttons-metrics-button-radius, 8px);
  border: var(--buttons-metrics-button-stroke-size, 1px) solid
    var(--buttons-colors-button-grey-text, #667085);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px;
}

.back-button:hover {
  background-color: var(--buttons-colors-button-grey-text, #66708548);
  color: white;
}

.back-button-label {
  color: var(--buttons-colors-button-grey-text, #667085);
  font-size: var(--buttons-typography-button-text-size, 14px);
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
}

.header {
  color: var(--text-text-color-base, #121418);
  font-size: 38px;
  font-style: normal;
  font-weight: 700;
  line-height: 44px;
  /* 115.789% */
  letter-spacing: -0.76px;
}

.Live-stats {
  display: flex;
  width: 336px;
  height: 100%;
  padding: var(--global-spacing-spacing-default, 16px);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  border-radius: 12px;
  background: var(--palettes-white-white, #fff);
  justify-content: space-evenly;
}
.small-chart {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.smallChart {
  width: 100% !important;
  height: 100% !important;
}
.info-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
}

.stat-name {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
}

.stat-value {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
}

.Live-stats p {
  color: var(--text-text-color-base, #121418);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: -0.32px;
  margin: 0px;
}
</style>
