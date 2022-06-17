function DutyGridCell({row, col, value, onClick}: {
  row: number,
  col: number,
  value: number,
  onClick: (row: number, col: number) => void,
}) {
  return (
    <td>
      <button className="duty-grid" onClick={() => onClick(row, col)}>
        {value}
      </button>
    </td>
  );
}

export default DutyGridCell;
