import db from "../client.js";
export async function getGreeting() {
  try {
    const SQL = "SELECT * FROM greetings;";
    const {
      rows: [greeting],
    } = await db.query(SQL);
    if(!greeting) throw new Error("not found");
    return greeting;
  } catch (error) {
    console.error(error);
  }
}
