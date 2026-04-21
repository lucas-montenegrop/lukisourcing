import PageHeader from "../components/PageHeader.jsx";

const fabrics = [
  {
    code: "25F012-F6",
    factory: "Mozartex",
    width: '57.5"',
    weight: "280 GSM",
    status: "Active",
  },
  {
    code: "PF10002065",
    factory: "Bombyx",
    width: '54"',
    weight: "166 GSM",
    status: "Sampling",
  },
  {
    code: "SJ-1408",
    factory: "Shinjintex",
    width: '55/56"',
    weight: "400 GSM",
    status: "Approved",
  },
];

export default function Fabrics() {
  return (
    <>
      <PageHeader
        eyebrow="Material Library"
        title="Fabrics"
        description="Browse and update fabric records by factory, width, and weight."
        actionLabel="+ Add Fabric"
      />

      <section className="card table-wrap">
        <div className="section-heading">
          <h2>Fabric Records</h2>
          <p>These rows can later be connected to your real API data.</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Factory</th>
              <th>Width</th>
              <th>Weight</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fabrics.map((fabric) => (
              <tr key={fabric.code}>
                <td>{fabric.code}</td>
                <td>{fabric.factory}</td>
                <td>{fabric.width}</td>
                <td>{fabric.weight}</td>
                <td>
                  <span className="tag neutral">{fabric.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
