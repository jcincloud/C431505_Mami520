interface SimpleUploadOption {
}

class SimpleUpload {
    constructor(options: any) {
    };
}

var ss = {
    SimpleUpload: SimpleUpload
}

declare module "simple-ajax-uploader" {
    export = ss;
}