import { test as setup } from '@playwright/test';
import user from '../.auth/user.json'
import fs from 'fs'

const authFile = '.auth/user.json'

setup('authentication', async ({ page, request }) => {
    // await page.goto('https://conduit.bondaracademy.com/'); //-->#60 replacing with api call below
    // await page.getByText('Sign in').click()    // --> #59 move from workingWithAPI.spec.ts to auth.setup.ts
    // await page.getByRole('textbox', { name: 'Email' }).fill('pwtest60@test.com')
    // await page.getByRole('textbox', { name: 'Password' }).fill('vd12345')
    // await page.getByRole('button').click()
    // await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')

    // await page.context().storageState({path: authFile})
        //                                                  // --> #60 adding below               
    const response = await request
    .post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
            "user": { "email": "pwtest60@test.com", "password": "vd12345" }
        }
    })
    const responseBody = await response.json()
    const accessToken = responseBody.user.token

    user.origins[0].localStorage[0].value = accessToken  // update user object values token received from the api
    fs.writeFileSync(authFile, JSON.stringify(user))     // then change it inside of the file (using fs lib)

    process.env['ACCESS_TOKEN'] = accessToken            // access to token to re-use in diff tests
})