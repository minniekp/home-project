const Selected = ({ selected }: { selected: any }) => {
  // your logic here
  return (
    <div>
      {/* Render selected items here */}
      {Array.isArray(selected) && selected.length > 0 ? (
        <ul>
          {selected.map((item: any, idx: number) => (
            <li key={idx}>{item.name || item.toString()}</li>
          ))}
        </ul>
      ) : (
        <span>No selection</span>
      )}
    </div>
  );
};

export default Selected;