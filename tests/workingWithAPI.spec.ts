import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach(async ({ page }) => {  // #57 - 2nd part delete article - we comment it cause don't need browser
    await page.route('*/**/api/tags', async route => {  // #55 mocking API
        await route.fulfill({
            body: JSON.stringify(tags)
        })
    })
    // await page.route('*/**/api/articles*', async route => { //--> #57 remove & Move Below//intercept response in variable
    //     const response = await route.fetch()                 // storing response in variable
    //     const responseBody = await response.json()           // storing in json
    //     responseBody.articles[0].title = 'This is a test title'  //modify of 1st title
    //     responseBody.articles[0].description = 'This is a test description' //modify of description

    //     await route.fulfill({
    //         body: JSON.stringify(responseBody)  // fulfill body response
    //     })
    // })
    await page.goto('https://conduit.bondaracademy.com/')
    // await page.getByText('Sign in').click()            //--> #59 move to auth.setup.ts by removing here
    // await page.getByRole('textbox', { name: 'Email' }).fill('pwtest60@test.com')
    // await page.getByRole('textbox', { name: 'Password' }).fill('vd12345')
    // await page.getByRole('button').click()
})

test('has title', async ({ page }) => {
    await page.route('*/**/api/articles*', async route => { //--> #57 move in from above & change with MOCK
        const response = await route.fetch()                 // storing response in variable
        const responseBody = await response.json()           // storing in json
        responseBody.articles[0].title = 'This is a MOCK test title'        //modify of MOCK title
        responseBody.articles[0].description = 'This is a MOCK description' //modify of MOCK description
        // responseBody.articles[0].title = 'This is a test title'              //modify of 1st title
        // responseBody.articles[0].description = 'This is a test description'  //modify of 1st description

        await route.fulfill({
            body: JSON.stringify(responseBody)
        })
    })

    await page.getByText('Global Feed').click()
    await expect(page.locator('.navbar-brand')).toHaveText('conduit') // assertion for page
    await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title') //assertions for test
    await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK description')
    await page.waitForTimeout(1000) //if assertion not present we need to wait *(bug in playwright)*
})

test('delete the article', async ({ page, request }) => {
    // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', { //-->#60 delete that
    //     data: {
    //         "user": { "email": "pwtest60@test.com", "password": "vd12345" }
    //     }
    // })
    // const responseBody = await response.json()
    // const accessToken = responseBody.user.token

    // console.log(responseBody.user.token) // --> refactor to the line above
    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
        data: {
            "article": { "title": "This is a test title", "description": "This is a test description", "body": "This is a test body", "tagList": [] }
        },
        // headers: {                                                   // //-->#60 delete that
        //     Authorization: `Token ${accessToken}`
        // }
    })
    expect(articleResponse.status()).toEqual(201)

    await page.getByText('Global Feed').click()
    await page.reload()
    await page.getByText('This is a test title').click()
    await page.getByRole('button', { name: 'Delete Article' }).first().click()
    await page.getByText('Global Feed').click()

    await expect(page.locator('app-article-list h1')
        .first()).not.toContainText('This is a test title') // assertion
})

test('create article', async ({ page, request }) => {  // #58
    await page.getByText('New Article')
        .click()
    await page.getByRole('textbox', { name: 'Article Title' })
        .fill('Playwright is awesome')
    await page.getByRole('textbox', { name: 'What\'s this article about?' })
        .fill('About the Playwright')                                           // use backslash
    // await page.getByRole('textbox', { name: "What's this article about?" })
    // .fill('About the Playwright')                                            // or double quotes
    await page.getByRole('textbox', { name: 'Write your article (in markdown)' })
        .fill('We like to use playwright for automation')
    await page.getByRole('button', { name: 'Publish Article' })
        .click()

    const articleResponse = await page
        .waitForResponse('https://conduit-api.bondaracademy.com/api/articles/') // intercept api response (back)
    const articleResponseBody = await articleResponse.json()                    // return  json object body
    const slugId = articleResponseBody.article.slug                             // from json we'll have slug ID

    await expect(page.locator('.article-page h1'))
        .toContainText('Playwright is awesome')                 // assertion
    await page.getByText('Home').click()
    await page.getByText('Global Feed').click()

    await expect(page.locator('app-article-list h1').first())
        .toContainText('Playwright is awesome')                 // assertion

    // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', { //#58 & #60 delete
    //     data: {
    //         "user": { "email": "pwtest60@test.com", "password": "vd12345" }
    //     }
    // })

    // const responseBody = await response.json()                                                     //#58 & #60 delete
    // const accessToken = responseBody.user.token
    // const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    //     headers: {
    //         Authorization: `Token ${accessToken}`
    //     }
    // })
    // await page.reload()                                                                   //#58 & #60 delete
    // expect(deleteArticleResponse.status()).toEqual(204)                                   //#58 & #60 delete
    const deleteArticleResponse = await request                                           // --> #60 
        .delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`) // intercept api call
    expect(deleteArticleResponse.status()).toEqual(204)
    await page.reload() 
})