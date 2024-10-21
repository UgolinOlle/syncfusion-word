import { Client } from "pg";

const client = new Client({
  user: "ugolin-olle",
  host: "localhost",
  database: "wealthcome_test",
  password: "",
  port: 5432,
});

client.connect();

export async function getAllVariables() {
  try {
    const res = await client.query(
      "SELECT variable_name, value FROM document_variables",
    );
    const variables = res.rows.map((row) => ({
      name: row.variable_name,
      value: row.value,
    }));

    return variables;
  } catch (error) {
    console.error("Erreur lors de la récupération des variables :", error);
    throw error;
  }
}
