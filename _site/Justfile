_default:
    @just --list --unsorted

# Build the site
build: setup
    bundle exec jekyll build

# jekyll serve, with livereload
serve: setup
    bundle exec jekyll serve --livereload
    
# Install dependencies
setup:
    bundle install
