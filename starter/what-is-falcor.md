---
layout: page
title: what is falcor
id: what_is_falcor
lang: en
---

## What is Falcor?

Every user wants to believe that all the data in the cloud is stored on their device. Falcor lets web developers code that way.

Falcor is a JavaScript library for data fetching. Falcor lets you represent all of your cloud data sources as *One Virtual JSON Model* on the server. On the client, you code as if the entire JSON model is available locally. Falcor retrieves any data you request from the cloud on-demand, handling network communication transparently.

Falcor lets you model your data as a graph in JSON with the JSON Graph specification. Falcor automatically optimizes and traverses references in your graph for you.

Falcor is not a replacement for your MVC framework, your database, or your application server. Instead you add Falcor to your existing stack to optimize client/server communication. Falcor is ideal for mobile apps, because it combines the caching benefits of REST with the low latency of RPC.

You retrieve data from a Falcor model using the familiar JavaScript path syntax.   

{% highlight javascript %}
var person = {
    name: "Steve McGuire",
    occupation: "Developer",
    location: {
      country: "US",
      city: "Pacifica",
      address: "344 Seaside"
    }
}

print(person.location.address);
{% endhighlight %}

This is the way you would retrieve data from the same JSON in a remote Falcor Model.  Note that the only difference is that the API is asynchronous.

{% highlight javascript %}
var person = new falcor.Model({
  source: new falcor.HttpSource("/person.json")
});

person.getValue("location.address").
  then(address => print(address));

// outputs "344 Seaside"
{% endhighlight %}