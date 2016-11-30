<template>
	<div id="not-ready">
		<div class="panel panel-default">
			<div class="panel-heading">
				<h3 class="panel-title">Waiting for Chat Room</h3>
			</div>
			<div class="panel-body">
				<p>
					The MFC Assistant is currently waiting for the chat room to be accessible.
				</p>
				<ul>
					<li>
						<b>On the Model Web:</b> the chat room is accessible when you begin broadcasting.
					</li>
					<li>
						<b>On the Member's site:</b> the chat room is accessible when you enter your own
						chat room. The MFC Assistant will only work for models logged into their
						model account and are in their own rooms. This prevents other users from
						using the MFC Assistant in a model's room without their consent!
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'not-ready'
}
</script>
