declare module "comm-cmpt" {

    //GridNavPage
    interface GridNavPageProps extends React.Props<GridNavPageClass> {
        onQueryGridData(p1: number): void,
        InsertType(): void,
        deleteSubmit(): void,
        nowPage: number,
        totalPage: number,
        startCount: number,
        endCount: number,
        recordCount: number,
        showAdd?: boolean,
        showDelete?: boolean
    }
    interface GridNavPage extends React.ReactElement<GridNavPageProps> { }
    interface GridNavPageClass extends React.ComponentClass<GridNavPageProps> {

    }
    var GridNavPage: GridNavPageClass;
    //GridButtonModify
    interface GridButtonModifyProps extends React.Props<GridButtonModifyClass> {
        modify(): void
    }
    interface GridButtonModify extends React.ReactElement<GridButtonModifyProps> { }
    interface GridButtonModifyClass extends React.ComponentClass<GridButtonModifyProps> {

    }
    var GridButtonModify: GridButtonModifyClass;
    //GridCheckDel
    interface GridCheckDelProps extends React.Props<GridCheckDelClass> {
        delCheck(p1: any, p2: any): void,
        iKey: number,
        chd: boolean,
        showAdd?: boolean
    }
    interface GridCheckDel extends React.ReactElement<GridCheckDelProps> { }
    interface GridCheckDelClass extends React.ComponentClass<GridCheckDelProps> {
    }
    var GridCheckDel: GridCheckDelClass;

    //InputDate
    interface InputDateProps extends React.Props<InputDateClass> {
        id: string,
        value: Date,
        onChange(field_name: string, date_value: Date): void,
        field_name: string,
        required: boolean,
        disabled: boolean,
        ver: number
    }
    interface InputDate extends React.ReactElement<InputDateProps> { }
    interface InputDateClass extends React.ComponentClass<InputDateProps> {
    }
    var InputDate: InputDateClass;

    interface ModalSalesProps extends React.Props<ModalSalesClass> {
        isShow: boolean,
        fieldSalesNo: string,
        fieldSalesName: string,
        setValue?(): void,
        close(): void
        updateView(sales_no: string, sales_name: string): void,
    }
    interface ModalSales extends React.ReactElement<ModalSalesProps> { }
    interface ModalSalesClass extends React.ComponentClass<ModalSalesProps> {
    }
    var ModalSales: ModalSalesClass;

    interface TipsProps extends React.Props<TipsClass> {
        isShow: boolean,
        fieldSalesNo: string,
        fieldSalesName: string,
        setValue?(): void,
        close(): void
        updateView(sales_no: string, sales_name: string): void,
    }
    interface Tips extends React.ReactElement<TipsProps> {
        comment: string,
        children?: any
    }
    interface TipsClass extends React.ComponentClass<TipsProps> {
    }
    var Tips: TipsClass;

    interface MasterImageUploadProps extends React.Props<MasterImageUploadClass> {
        url_upload?: string,
        url_list?: string,
        url_delete?: string,
        url_download?: string,
        url_sort?: string,
        FileKind?: string,
        MainId: number | string,
        ParentEditType?: number
    }
    interface MasterImageUpload extends React.ReactElement<MasterImageUploadProps> { }
    interface MasterImageUploadClass extends React.ComponentClass<MasterImageUploadProps> {
    }
    var MasterImageUpload: MasterImageUploadClass;

    //twaddress
    interface TwAddressProps extends React.Props<TwAddressClass> {
        onChange(fieldName: string, e: React.SyntheticEvent): void,
        setFDValue(fieldName: string, e: React.SyntheticEvent): void,
        zip_value: string,
        zip_field: string,
        city_value: string,
        city_field: string,
        country_value: string,
        country_field: string,
        address_value: string,
        address_field: string,
        required?: boolean,
        disabled?: boolean,
        ver?: number
    }
    interface TwAddress extends React.ReactElement<TwAddressProps> { }
    interface TwAddressClass extends React.ComponentClass<TwAddressProps> {
    }
    var TwAddress: TwAddressClass;

    //stateforgrid
    interface StateForGirdProps extends React.Props<StateForGirdClass> {
        stateData: Array<server.StateTemplate>, id: number, ver?: number 
    }
    interface StateForGird extends React.ReactElement<StateForGirdProps> { }
    interface StateForGirdClass extends React.ComponentClass<StateForGirdProps> {
    }
    var StateForGird: StateForGirdClass;
}