const Row = ({ p, v }: any) => {
  //   console.log(props);
  return (
    <div style={{ display: 'flex', gap: '50px' }}>
      <div>{p}</div>
      <div>{v}</div>
    </div>
  );
};
export default Row;
