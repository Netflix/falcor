## Bind to the Cloud

I think a brief description should go here, possibly accompanied by a simple diagram that is fairly wide, showing the data flow and where falcor sits in the stack.  
  
The most recent talk could also be embedded here, as that's a great introduction.  
  
In place of such content, here's a placeholder image:  
  
<img src="https://burntretina.files.wordpress.com/2014/02/house-of-cards-cast1.jpg" class="img img-responsive">      

<!-- This bit has to be html to achieve the 3 column layout -->
<div class="row row-gap-medium">
  <div class="col-sm-4">
    {% capture the_include %}{% include homepage-key-feature-1.md %}{% endcapture %}
    {{ the_include | markdownify }}
  </div>
  <div class="col-sm-4">
    {% capture the_include %}{% include homepage-key-feature-2.md %}{% endcapture %}
    {{ the_include | markdownify }}
  </div>
  <div class="col-sm-4">
    {% capture the_include %}{% include homepage-key-feature-3.md %}{% endcapture %}
    {{ the_include | markdownify }}
  </div>
</div>


### Things to check out in the current site draft:

There are some syntax highlighting examples on the getting started pages.

I'm also experimenting with light animation to make a user's first visit really pop. This animation would trigger *only* for a user's first visit to the site, then it'd cookie them and display instantly going forward.

- [Here's a quick sketch of one intro idea]({{ site.baseurl }}/?animated)
- [Here's an alternate version]({{ site.baseurl }}/?altimated)
- or [Go back to no animations]({{ site.baseurl }}/)

{% include something.html %}

