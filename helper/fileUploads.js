
var randomstring = require("randomstring");
module.exports = {


fileUpload: (file ) => {
    let file_name_string = file.name;
    var file_name_array = file_name_string.split(".");
    var file_extension = file_name_array[file_name_array.length - 1];
    var result = randomstring.generate(25);
    let name = result + "." + file_extension;
    file.mv(
        process.cwd() + `/storage/app/public/${name}`,
        function (err) {
            if (err) throw err;
        }
    );
    return process.env.APP_IMAGE+name;
},





multipleFileUpload: (files) => {
    console.log("***************  call multipleFileUpload *********************");
    let names = [];

    if (files.length > 1) {
        files.forEach((file) => {
            let file_name_string = file.name;
            var file_name_array = file_name_string.split(".");
            var file_extension = file_name_array[file_name_array.length - 1];
            var result = randomstring.generate(25);
            let name = result + "." + file_extension;
            file.mv(
                process.cwd() + `/storage/app/public/${name}`,
                function (err) {
                    if (err) throw err;
                }
            );
            names.push(process.env.APP_IMAGE+name);
        });
    } else {
        let file_name_string = attachment.name;
        var file_name_array = file_name_string.split(".");
        var file_extension = file_name_array[file_name_array.length - 1];
        console.log(
            "file_extension else ----------------- " + file_extension
        );
        var result = randomstring.generate(25);
        let name = result + "." + file_extension;
        attachment.mv(
            process.cwd() + `/storage/app/public/${name}`,
            function (err) {
                if (err) throw err;
            }
        );
        names.push(process.env.APP_IMAGE+name);
    }
    return names;
},
}
