# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "envy"
  spec.version       = "0.1.0"
  spec.authors       = ["Joshua Draxten"]
  spec.email         = ["joshuadraxten@live.com"]

  spec.summary       = "G R E E D Y B O Y"
  spec.homepage      = "https://greedyboy.co"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(assets|_layouts|_includes|_sass|LICENSE|README|feed|robots|sitemap)!i) }

  spec.add_runtime_dependency "jekyll", "~> 4.0"

  spec.add_development_dependency "bundler", "~> 1.16"
  spec.add_development_dependency "rake", "~> 12.0"
end
