import { useEffect, useState } from "react";
import {
  getSummary,
  getDevices,
  getRecommendations,
} from "../services/dashboardService";

export default function useDashboard() {
  const [summary, setSummary] = useState(null);
  const [devices, setDevices] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const summaryData = await getSummary();
        const devicesData = await getDevices();
        const recommendationData = await getRecommendations();

        setSummary(summaryData);
        setDevices(devicesData.value || []);
        setRecommendations(recommendationData);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      }
    }

    loadData();
  }, []);

  return {
    summary,
    devices,
    recommendations,
  };
}