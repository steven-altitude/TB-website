const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {

  // Pass-through static assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("src/assets/img");

  // Date filters
  eleventyConfig.addFilter("readableDate", (dateObj, locale = "es-EC") => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).setLocale(locale).toFormat("dd LLLL yyyy");
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addFilter("isoDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO();
  });

  // Blog collections
  eleventyConfig.addCollection("postsES", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/es/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("postsEN", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/en/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Team collections — sorted by `orden`, only active members
  const teamCollection = (folder) => (collectionApi) =>
    collectionApi
      .getFilteredByGlob(`src/team/${folder}/*.md`)
      .filter((m) => m.data.activo !== false)
      .sort((a, b) => (a.data.orden || 99) - (b.data.orden || 99));

  eleventyConfig.addCollection("asociados",  teamCollection("asociados"));
  eleventyConfig.addCollection("socias",     teamCollection("socias"));
  eleventyConfig.addCollection("asesores",   teamCollection("asesores"));
  eleventyConfig.addCollection("financiero", teamCollection("financiero"));

  return {
    dir: {
      input:    "src",
      output:   "_site",
      includes: "_includes",
      data:     "_data",
    },
    templateFormats:   ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
