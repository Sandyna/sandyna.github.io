#!/usr/bin/env python3
import os

template = """---
title: {name}
layout: recipe
time: {time}
servings: {servings}
source: {source}
image: ./image.jpg
---

## Ingredients
{ingredient_list}

## Instructions
{instructions}"""

def main():

  recipe_names = os.scandir(path='./recipes')
  for recipe_name in recipe_names:
  #  print(os.listdir(path = name))
    input_path = ""
    if not recipe_name.is_dir():
        continue

    for file_ in os.listdir(path = recipe_name):
      if "input" in file_:
        input_path = "./recipes/" + recipe_name.name + "/" + file_
  #      print(input_path)
        new(input_path, recipe_name)

def new(input_path, recipe_name):
    try:
      inputlines = [x.strip() for x in open(input_path, "r").readlines()] # remove leading and trailing whitespace, e.g. \n at the end of each line
      name, time, servings, source = inputlines[:4]
      if '?' in time:
      	time = ' '
      if '?' in servings:
      	servings = ' '
      inputlines = inputlines[5:]
      ing_list = []
      while (inputlines [0]):
        ing_list.append(inputlines [0])
        inputlines = inputlines [1:]
      inputlines = inputlines [1:]
      inst_list = [x + "<br/>" for x in inputlines]

      out_ingredients = ['* ' + ingredient if ':' not in ingredient else '\n### ' + ingredient.strip(':') for ingredient in ing_list]
      ingredientsstr = '\n'.join(out_ingredients)
      instructionsstr = '\n'.join(inst_list)

      recipe_md = open("./recipes/" + recipe_name.name + "/" + recipe_name.name + ".md", "w+")
      recipe_md.write(template.format(name=name, time=time, servings=servings, source=source, ingredient_list=ingredientsstr, instructions=instructionsstr))
    except Exception as e:
      print("encountered error on: " + str(recipe_name))
      print(e)

main()
