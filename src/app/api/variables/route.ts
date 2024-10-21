import { NextResponse } from "next/server";

import { getAllVariables } from "~/lib/database";

export async function GET() {
  try {
    const variables = await getAllVariables();
    return NextResponse.json(variables, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des variables :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des variables" },
      { status: 500 },
    );
  }
}
