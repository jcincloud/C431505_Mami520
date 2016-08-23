module BaseDefine {
    //base interface
    export interface GridRowPropsBase<R> {
        key?: number,
        ikey: number,
        itemData: R,
        chd?: boolean,
        delCheck(p1: number, p2: boolean): void,
        updateType(p1: number | string): void,
        primKey: number | string
    }
    export interface GridRowStateBase { }

    export interface GridFormPropsBase {
        apiPath?: string,
        apiPathDetail?: string,
        gdName?: string,
        fdName?: string,
        menuName?: string,
        caption?: string,
        iconClass?: string,
        showAdd?: boolean
    }
    export interface GirdFormStateBase<G, F> {
        gridData?: {
            rows: Array<G>,
            page: number,
            startcount?: number,
            endcount?: number,
            total?: number,
            records?: number
        },
        fieldData?: F,
        searchData?: { UserName?: string },
        edit_type?: number,
        checkAll?: boolean
    }
}