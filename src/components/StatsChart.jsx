import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../styling/componentStyling/StatsChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StatsChart = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState(null);

  // Mock data generator
  const generateMockData = (range) => {
    const ranges = {
      day: 24,
      week: 7,
      month: 30,
      '3months': 90,
      '6months': 180,
      year: 365
    };

    const dataPoints = ranges[range];
    const labels = [];
    const restaurants = [];
    const checkins = [];
    const signups = [];

    for (let i = 0; i < dataPoints; i++) {
      labels.push(range === 'day' ? `${i}:00` : `Day ${i + 1}`);
      restaurants.push(Math.floor(Math.random() * 50) + 100);
      checkins.push(Math.floor(Math.random() * 200) + 300);
      signups.push(Math.floor(Math.random() * 30) + 20);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Restaurants',
          data: restaurants,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1
        },
        {
          label: 'Check-ins',
          data: checkins,
          borderColor: 'rgb(53, 162, 235)',
          tension: 0.1
        },
        {
          label: 'Signups',
          data: signups,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };

  useEffect(() => {
    setChartData(generateMockData(timeRange));
  }, [timeRange]);

  return (
    <div className="stats-chart-container">
      <div className="time-range-filters">
        <button 
          className={`filter-btn ${timeRange === 'day' ? 'active' : ''}`}
          onClick={() => setTimeRange('day')}
        >
          Day
        </button>
        <button 
          className={`filter-btn ${timeRange === 'week' ? 'active' : ''}`}
          onClick={() => setTimeRange('week')}
        >
          Week
        </button>
        <button 
          className={`filter-btn ${timeRange === 'month' ? 'active' : ''}`}
          onClick={() => setTimeRange('month')}
        >
          Month
        </button>
        <button 
          className={`filter-btn ${timeRange === '3months' ? 'active' : ''}`}
          onClick={() => setTimeRange('3months')}
        >
          3 Months
        </button>
        <button 
          className={`filter-btn ${timeRange === '6months' ? 'active' : ''}`}
          onClick={() => setTimeRange('6months')}
        >
          6 Months
        </button>
        <button 
          className={`filter-btn ${timeRange === 'year' ? 'active' : ''}`}
          onClick={() => setTimeRange('year')}
        >
          1 Year
        </button>
      </div>
      {chartData && (
        <div className="chart-wrapper">
          <Line data={chartData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Platform Statistics'
              }
            }
          }} />
        </div>
      )}
    </div>
  );
};

export default StatsChart;