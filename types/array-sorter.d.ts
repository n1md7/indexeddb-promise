declare type PropObject = {
  keys?: string | string[];
  desc?: boolean;
};
export declare type Props = PropObject | string | null;
export default class ArraySorter<ItemType> {
  private readonly listToBeSorted;
  constructor(listToBeSorted: ItemType[]);
  sortBy(props?: Props): ItemType[];
  private sortPlainList;
  private sortListOfObjects;
}
export {};
