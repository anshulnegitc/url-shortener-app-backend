# Url Shortener Application

It's an imitation of **Url Shortener Service.**

Only **functional requirements** are considered while developing this project i.e **to generate short url and redirect short url to original url.**

In case url got expired/moved to other domain/not responsding, a 404 error page is shown.

**Redis is used as primary as well as caching database here.**

Some analytics and expression values(like,star,thumbs up etc...) are permanently stored in database while urls are short lived.

**Application Architecture.**
![Application-Architrecture](https://user-images.githubusercontent.com/55315115/187064974-93993fd0-2c64-4464-9e88-0912835b336e.jpg)

**Desktop View.**
![Img-1](https://user-images.githubusercontent.com/55315115/187065005-b5b86519-252b-4ebc-83c2-3340e887504d.png)

**404 Page.**
![Img-2](https://user-images.githubusercontent.com/55315115/187065040-67708e7e-fe8d-4c7b-811b-e08408a8810c.png)

**Analytics.**
![Img-4](https://user-images.githubusercontent.com/55315115/187065025-7f28fd3b-ac16-45f4-aee3-8600052f5c01.png)

**Mobile View.**
![Img-3](https://user-images.githubusercontent.com/55315115/187065011-d359e042-abd4-404a-8e23-617a5a21b484.png)



# Overview video

Here's a short video that explains the project and how it uses Redis:

[![Url Shortener](https://user-images.githubusercontent.com/55315115/187065005-b5b86519-252b-4ebc-83c2-3340e887504d.png)](https://youtu.be/YJlg9RTmKDM)

## How it works

### How the data is stored:

* Urls.
    * It maps the long_url with short_url.
    * short_url is base62 value of counter and is indexed.
    * Expiration of 30 mins is set.
    * Data is stored as
````
class Url extends Entity { }
const urlSchema = new Schema(Url, {
    long_url: { type: 'string' },
    short_url: { type: 'string', indexed: true }
});
client.execute(['EXPIRE', `Url:EntityId`, 1800]);
````
* Range.
    * It's a key-value pair to store the current range of counter, initialise at the first time with 1,00,000.
    * And gets incremented by 1,00,000 after every server restart/crash.
````
client.execute(['SET', 'range', 100000]);
````

````
client.execute(['INCRBY','range', 100000]);
````

* Counter.
    * Stores the expression(visitor count,links redirected,links generated, heart,like and star).
    * It permanently stores data and increment the count on respective operation.
    * * As total visitor to a website is stored as `{entityId:"something",name:'visitor',count:2}`
    * * And so on for every count on website.
````
class Counter extends Entity { }
const counterSchema = new Schema(Counter, {
    name: { type: 'string', indexed: true },
    count: { type: 'number' },
});
counterEntity = await CounterRepository().fetch(id);
counterEntity.entityData.count += 1;
CounterRepository().save(counterEntity);
````

* Continent.
    * Stores continent wise analytics on the website.
    * It permanently stores data and increment the count of the fields on respective operation.
    * On respective operation continent name is fetched and incremented the operation count.
    * If on initial phase no continent is found then it creates a new one.
    * * Data is stored as `{entityId:"",name:'Asia',links_gen:2,links_redirect:1,visitor:12}`
````
class Continent extends Entity { }
const continentSchema = new Schema(Continent, {
    name: { type: 'string', indexed: true },
    links_gen: { type: 'number' },
    links_redirect: { type: 'number' },
    visitor: { type: 'number' },
});
let continentEntity = ContinentRepository().search().where('name').equals(result.continent).return.all();
if (continentEntity.length) {
    continentEntity[0].entityData[[type]] += 1;
    ContinentRepository().save(continentEntity[0]);
} else {
    const entity = ContinentRepository().createEntity();
    entity.name = result.continent;
    entity.visitor = 1;
    entity.links_gen = 0;
    entity.links_redirect = 0;
    ContinentRepository().save(entity);
}
````
    
### How the data is accessed:


* Urls.
    * Code is base62 counter value.
    * On success it redirect to the original url and on failure 404 page.
````
url=UrlRepository().search().where('short_url').equals(code).return.first();
In place of all we can use first also
````

* Expression.
    * A list is fetched, which has count of visitor, link generated, links redirected, thumbs up, like and heart except the counter range.
````
const records = CounterRepository().search().return.all();
````

* Continent.
    * For desktop view individual continents analytics are fetched by continent name and for mobile view a list of continents are fetched.
````
records = await ContinentRepository().search().where('name').equals(c).return.all();
````

````
records = await ContinentRepository().search().return.all();
````




## How to run it locally?



### Prerequisites
* NodeJs 14.x
* Npm 6.x

### Local installation

* Backend setup guide
   * `git clone https://github.com/anshulnegitc/url-shortener-app-backend.git`
   * `cd project-directory`
   * `npm install`
   * `create .env file and save variable as follows`
   * set NODE_ENV to 'local' when running locally otherwise production.
````
NODE_ENV=local
REDIS_URL = "Paste Redis host url here in this format [redis://username:password@connection-url:port]"   
PORT = 51029
LINK_EXPIRATION_TIME = 1800
FRONT_END_URL = http://localhost:3000/
LOCAL_IP="" 
[ paste your ip address here as in local env. 
no analytics will be recorded so setting it manually 
follow this link https://www.whatismyip.com/]
````
   * `and at last run command node index.js`

* Frontend setup guide
   * `git clone https://github.com/anshulnegitc/url-shortener-app-frontend.git`
   * `cd project-directory`
   * `npm install`
   * `create .env file and save variable as follows`
````
REACT_APP_BASE_URL=http://localhost:51029/
````
   * `and at last run command npm start`

## Deployment

To make deploys work, you need to create free account on [Redis Cloud](https://redis.info/try-free-dev-to)

### Heroku

#### Backend
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/anshulnegitc/url-shortener-app-backend)

````
Set environment variables
FRONT_END_URL = "" //Frontend url eg https://u-sh-app.herokuapp.com/
LINK_EXPIRATION_TIME = 1800 //expiration time in seconds
NODE_ENV = production
REDIS_URL="" // redis host url
````

## More Information about Redis Stack

Here some resources to help you quickly get started using Redis Stack. If you still have questions, feel free to ask them in the [Redis Discord](https://discord.gg/redis) or on [Twitter](https://twitter.com/redisinc).

### Getting Started

1. Sign up for a [free Redis Cloud account using this link](https://redis.info/try-free-dev-to) and use the [Redis Stack database in the cloud](https://developer.redis.com/create/rediscloud).
1. Based on the language/framework you want to use, you will find the following client libraries:
    - [Redis OM .NET (C#)](https://github.com/redis/redis-om-dotnet)
        - Watch this [getting started video](https://www.youtube.com/watch?v=ZHPXKrJCYNA)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-dotnet/)
    - [Redis OM Node (JS)](https://github.com/redis/redis-om-node)
        - Watch this [getting started video](https://www.youtube.com/watch?v=KUfufrwpBkM)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-node/)
    - [Redis OM Python](https://github.com/redis/redis-om-python)
        - Watch this [getting started video](https://www.youtube.com/watch?v=PPT1FElAS84)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-python/)
    - [Redis OM Spring (Java)](https://github.com/redis/redis-om-spring)
        - Watch this [getting started video](https://www.youtube.com/watch?v=YhQX8pHy3hk)
        - Follow this [getting started guide](https://redis.io/docs/stack/get-started/tutorials/stack-spring/)

The above videos and guides should be enough to get you started in your desired language/framework. From there you can expand and develop your app. Use the resources below to help guide you further:

1. [Developer Hub](https://redis.info/devhub) - The main developer page for Redis, where you can find information on building using Redis with sample projects, guides, and tutorials.
1. [Redis Stack getting started page](https://redis.io/docs/stack/) - Lists all the Redis Stack features. From there you can find relevant docs and tutorials for all the capabilities of Redis Stack.
1. [Redis Rediscover](https://redis.com/rediscover/) - Provides use-cases for Redis as well as real-world examples and educational material
1. [RedisInsight - Desktop GUI tool](https://redis.info/redisinsight) - Use this to connect to Redis to visually see the data. It also has a CLI inside it that lets you send Redis CLI commands. It also has a profiler so you can see commands that are run on your Redis instance in real-time
1. Youtube Videos
    - [Official Redis Youtube channel](https://redis.info/youtube)
    - [Redis Stack videos](https://www.youtube.com/watch?v=LaiQFZ5bXaM&list=PL83Wfqi-zYZFIQyTMUU6X7rPW2kVV-Ppb) - Help you get started modeling data, using Redis OM, and exploring Redis Stack
    - [Redis Stack Real-Time Stock App](https://www.youtube.com/watch?v=mUNFvyrsl8Q) from Ahmad Bazzi
    - [Build a Fullstack Next.js app](https://www.youtube.com/watch?v=DOIWQddRD5M) with Fireship.io
    - [Microservices with Redis Course](https://www.youtube.com/watch?v=Cy9fAvsXGZA) by Scalable Scripts on freeCodeCamp
