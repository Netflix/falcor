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

<hr>

{% include homepage-getting-started.md %}
