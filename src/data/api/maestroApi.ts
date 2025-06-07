import { apiUrl } from "../../../env";

export const getMaestros = async () => {
  const url = `${apiUrl}/users/rol/maestro/`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
