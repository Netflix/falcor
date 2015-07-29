## Exciting summary

I think a brief description should go here, possibly accompanied by a simple diagram that is fairly wide, showing the data flow and where falcor sits in the stack.  
  
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

There are some syntax highlighting examples on the getting started page.

I'm also experimenting with light animation to make a user's first visit really pop. [Here's a quick sketch of one idea]({{ site.baseurl }}/?animated) (or [Go back to no animations]({{ site.baseurl }}/))

I plan to make the menus pretty similar to the ones on the main netflix web ui, as I think that would fit well with the site (as well as add brand-wide visual similarity).

{% include something.html %}

