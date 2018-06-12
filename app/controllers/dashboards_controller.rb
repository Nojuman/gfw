class DashboardsController < ApplicationController

  layout 'application_react'
  before_action :check_water_bodies, :set_title, only: [:index, :embed]

  def index
    @title = @location && @location["name"] || @location
    @desc = "Data about forest change, tenure, forest related employment and land use in #{@title}"
    # if params[:widget]
    #   widgets_config = JSON.parse(File.read(Rails.root.join('app', 'javascript', 'components', 'widget', 'widget-config.json')))
    #   widget_data = widgets_config[params[:widget]]
    #   @og_title = "#{widget_data["title"]} in #{@location}"
    #   # for dynamic widget image when the feature is ready
    #   # @img = "widgets/#{@widget}.png"
    # end
  end

  def embed
    @title = @location && @location["name"] || @location
    @desc = "Data about forest change, tenure, forest related employment and land use in #{@title}"
    render layout: 'application_react_embed'
  end

  private

  def check_water_bodies
    if params[:sub_region]
      if Dashboards.is_water_body(params[:iso], params[:region], params[:sub_region])
        redirect_to action: "index", type: 'global'
      end
    end
    return false
  end

  def set_title
    @location = params[:iso] ? Dashboards.find_country_by_iso(params[:iso]) : "#{params[:type] && params[:type].capitalize || 'Global'} Dashboard"
    if !@location
      redirect_to action: "index", type: 'global'
    end
  end
end
