class NotificationsController < ApplicationController
  def index
    @notifications = Notification.for_user(current_user.id)
    render json: @notifications.paginate(page: params[:page], per_page: params[:per_page])
  end
  
  def show_by_criteria
    @notification = Notification.where(notification_params)
    if !@notification.nil?
      render(json: @notification, status: :ok)
    else
      render json: { message: 'no notification found' }
    end
  end

  private

  def notification_params
    if params.key?('notification') && !params[:notification].empty?
      params.require(:notification).permit(:user_id, :resource_id, :resource_type, :notification_type_id)
    else
      params[:notification_type_id] ||= []
      params[:resource_id] ||= []
      params.permit(:user_id, :resource_type, :notification_type_id,
                    :resource_id, notification_type_id: [], resource_id: [])
    end
  end
end
