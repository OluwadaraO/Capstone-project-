import React, { useEffect, useState } from "react";
import { useAuth } from "./RedirectToAuthentication";
import {Bar} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function BarChart({healthScores}){
    const [chartData, setChartData] = useState([]);
    const {user} = useAuth()
    useEffect(() => {
        if (healthScores.length > 0){
            const labels = healthScores.map(score => score.recipeName);
            const data = healthScores.map(score => score.healthScore);
            const backgroundColors = healthScores.map(score => score.healthColor)

            setChartData({
                labels,
                datasets:[
                    {
                        label: `Health Scores for ${user.name}`,
                        data,
                        backgroundColor: backgroundColors
                    },
                ],
            });
        }
    }, [healthScores])
    return (
      <div className="chart-details">
        {chartData.labels && (
            <Bar data={chartData} options={{
                scales: {
                    y:{
                        beginAtZero: true,
                    },
                },
            }}/>
        )}
      </div>
    );
};
export default BarChart;
