import {parse} from '@superquery/parse-pegjs'

class GitFlow {
    constructor(auth) {
        this.auth = auth;
        console.log(`in GitFlow constructor, auth is ${auth}`)
    }

    select(sql){
        console.log(`in select`)
        let  parsedSQL = parse(sql);
        debugger;

    }
    update(){
        console.log(`in update`)

    }
    delete(){
        console.log(`in delete`)

    }

}

export default GitFlow
