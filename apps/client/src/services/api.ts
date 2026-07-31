export const searchPatent = async (data: {
  title: string;
  abstract: string;
  claims: string;
}) => {

  console.log(data);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    results: [
      {
        id: 1,
        title: "AI Based Crop Monitoring System",
        similarity: 94,
        ipc: "G06F"
      },
      {
        id: 2,
        title: "Smart Irrigation Using IoT",
        similarity: 91,
        ipc: "A01G"
      },
      {
        id: 3,
        title: "Autonomous Plant Disease Detection",
        similarity: 88,
        ipc: "G06N"
      }
    ],

    report: {
      novelty: 5,
      inventiveStep: 4,
      industrialApplicability: 5,
      overall: 89
    }
  };
};