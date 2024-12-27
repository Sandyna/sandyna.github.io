---
title: Cook Book v III
layout: default
---

<h1>List of recipes</h1>
<br/>

<!--<div class="categories">
	How do I get a list of all categories? Without posts. I don't want posts because they have a compulsory stupid naming convention
	{% for category in site.categories %}
		{{ category }}
	{% endfor %}
</div>
-->

<div class="recipes_list">
	<ul>
		{% for page in site.pages %}
			{% if page.title != "Cook Book v III" %}
				<li>
					<a href=".{{ page.url }}">{{ page.title }}</a>
				</li>
			{% endif %}
		{% endfor %}
	</ul>
</div>

<img src="assets/images/lets_bake.gif">
<br/>
<!--
You can use HTML elements in Markdown, such as the comment element, and they won't be affected by a markdown parser. However, if you create an HTML element in your markdown file, you cannot use markdown syntax within that element's contents.
-->
