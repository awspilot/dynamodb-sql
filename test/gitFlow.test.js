import {parse} from '@superquery/parse-pegjs'
import expect from 'expect'
import GitFlow from '../gitFlow'



describe('new Test ', function () {
    this.timeout(60000)
    it('getLocalSocketInfo positive test', async (done) => {
        let gitflow = new GitFlow('myAuth')

        gitflow.select("select * from xxx where field = 'myValue'")
        console.log("aaa",gitflow)
        done()
    })

})
