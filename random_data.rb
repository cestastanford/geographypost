#!/usr/bin/env ruby
#
# Jason A. Heppler | jason@jasonheppler.org | jasonheppler.org
# MIT License <http://heppler.mit-license.org/>
#
# Created: 2014-09-12

150.times do
  chosen = File.readlines("data/post_data.csv").sample
  File.open("random.csv", "a") do |output|
    output.write "#{chosen}"
  end
end
