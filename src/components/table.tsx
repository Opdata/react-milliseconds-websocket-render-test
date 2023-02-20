import Row from './row';

const Table = ({ table }: any) => {
  return table.map(() => {
    <Row />;
  });
};
export default Table;
