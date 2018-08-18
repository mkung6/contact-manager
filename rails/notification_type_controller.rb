class NotificationTypesController < ApplicationController
  def show_by_category
    @notification_type = NotificationType.find_by(notification_category: params[:notification_category])
    if !@notification_type.nil?
      render(json: @notification_type, status: :ok)
    else
      render json: @notification_type.errors, status: 400
    end
  end
end
