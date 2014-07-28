#!/usr/bin/ruby

#
# Jason A. Heppler | 2014-07-10
# http://heppler.mit-license.org/
#
# Ruby 2.0.0-p353
#

require 'rubygems'
require 'json'
require 'csv'

if ARGV.size != 2
  puts 'Usage: csv_to_json input_file.csv output_file.json'
  puts 'This script uses the first line of the csv file as the keys for the JSON properties of the objects'
  exit(1)
end

f = File.open("/Users/jheppler/work/ATSP/ATS\ -\ History/Projects/Taylor-Polesky/ribbongraph/data/grains.csv", "r")

lines = CSV.open(ARGV[0]).readlines
keys = lines.delete lines.first

File.open(ARGV[1], "w") do |f|
  data = lines.map do |values|
    Hash[keys.zip(values)]
  end
  f.puts JSON.pretty_generate(data)
end

# json_output = CSV.parse(f).to_json
# File.open("output.json", "w") { |file| file.write(json_output) }
