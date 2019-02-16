using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using AwesomeCMSCore.Modules.Helper.Extensions;
using AwesomeCMSCore.Modules.Queue.Services;
using AwesomeCMSCore.Modules.Queue.Settings;
using AwesomeCMSCore.Modules.Shared.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace AwesomeCMSCore.Modules.Admin.Services
{
	public class AssetService : IAssetService
	{
		private readonly IOptions<AssetSettings> _assetSettings;
		private readonly IQueueService _queueService;

		public AssetService(IOptions<AssetSettings> assetSettings, IQueueService queueService)
		{
			_assetSettings = assetSettings;
			_queueService = queueService;
		}

		public async Task<string> UploadAssets(IFormFile file, string fileName)
		{
			try
			{
				var storePath = Path.Combine(_assetSettings.Value.StorePath, $"{fileName}.{file.ContentType.Split("/")[1]}");
				using (var stream = new FileStream(storePath, FileMode.Create))
				{
					await file.CopyToAsync(stream);
				}

				var assetPath = Path.Combine(_assetSettings.Value.AssetPath, $"{fileName}.{file.ContentType.Split("/")[1]}");

				var queueOptions = new QueueOptions
				{
					QueueName = QueueName.ImageResizeProcessing.ToString(),
					Message = assetPath,
					IsObject = false,
					RoutingKey = QueueName.ImageResizeProcessing.ToString()
				};

				_queueService.PublishMessage(queueOptions);

				return assetPath;
			}
			catch (Exception)
			{
				throw;
			}
		}
	}
}
