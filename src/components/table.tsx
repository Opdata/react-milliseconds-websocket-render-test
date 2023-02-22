import Row from './orderItem';

const Table = ({ table }: any) => {
  return table.map(() => {
    <Row />;
  });
};
export default Table;
