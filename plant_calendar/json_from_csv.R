spreadsheet_path <- "plant_calendar/plant_data.csv"
df <- read.csv(spreadsheet_path, stringsAsFactors = FALSE)

output_file <- "plant_calendar/plants.json"

#replace NA (empty cells) with null
df[] <- lapply(df, function(x) {
  ifelse(is.na(x), "null", x)
})

#this clears the file, append in the next ones
cat("[\n", file = output_file)
for (i in 1:nrow(df)) {
  row <- df[i, ]
  
  format_val <- function(x) {
    if (x == "null") return("null")       		# keep null as literal
      paste0("\"", gsub('"', '\\"', x), "\"")   # wrap everything else in quotes, escape " characters
  }
  
  cat("{\n",
      "\t\"id\": ", format_val(row$id), ",\n",
      "\t\"name\": ", format_val(row$name), ",\n",
      "\t\"sow_indoors\": ", format_val(row$sow_indoors), ",\n",
      "\t\"sow_outdoors\": ", format_val(row$sow_outdoors), ",\n",
      "\t\"transplant\": ", format_val(row$transplant), ",\n",
      "\t\"sun_needs\": ", format_val(row$sun_needs), ",\n",
      "\t\"water_needs\": ", format_val(row$water_needs), ",\n",
      "\t\"icon\": ", format_val(row$icon), ",\n",
      "\t\"alternate_text\": ", format_val(row$alternate_text), ",\n",
      "\t\"tooltip\": ", format_val(row$tooltip), "\n",
      "}", ifelse(i == nrow(df), "\n", ",\n"),
      sep = "",
      file = output_file, append = TRUE)
}

cat("]\n", file = output_file, append = TRUE)
