class Dashboards
  class << self
    def find_all_countries
      url = "#{ENV['CARTO_API_URL']}/sql?q=SELECT%20DISTINCT%20iso,%20name_engli%20as%20name%20FROM%20gadm28_countries%20WHERE%20iso%20!=%20'XCA'%20AND%20iso%20!=%20'TWN'"
      # CACHE: &bust=true if you want to flush the cache
      response = Typhoeus.get(url, headers: {"Accept" => "application/json"})
      if response.success? and (response.body.length > 0)
        JSON.parse(response.body)["rows"]
      else
        nil
      end
    end

    def find_country_by_iso(iso)
      return nil unless iso
      url = "#{ENV['CARTO_API_URL']}/sql?q=SELECT%20iso,%20name_engli%20as%20name%20FROM%20gadm28_countries%20WHERE%20iso%20=%20'#{iso}'%20AND%20iso%20!=%20'XCA'%20AND%20iso%20!=%20'TWN'%20LIMIT%201"
      # CACHE: &bust=true if you want to flush the cache
      response = Typhoeus.get(url, headers: {"Accept" => "application/json"})
      if response.success? and (response.body.length > 0)
        JSON.parse(response.body)["rows"][0]
      else
        nil
      end
    end

    def is_water_body(iso, adm1, adm2)
      return nil unless iso
      url = "#{ENV['CARTO_API_URL']}/sql?q=SELECT%20adm2%20FROM%20water_bodies_gadm28%20WHERE%20iso%20%3D%20%27#{iso}%27%20AND%20adm1%20%3D%20%27#{adm1}%27"
      # CACHE: &bust=true if you want to flush the cache
      response = Typhoeus.get(url, headers: {"Accept" => "application/json"})
      if response.success? and (response.body.length > 0)
        return JSON.parse(response.body)["rows"].any? {|i| i.adm2 === adm2}
      else
        nil
      end
    end
  end
end
