﻿using System.Threading.Tasks;
using AwesomeCMSCore.Modules.Admin.Repositories;
using AwesomeCMSCore.Modules.Admin.ViewModels;
using AwesomeCMSCore.Modules.Helper.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AwesomeCMSCore.Modules.Admin.Controllers.API.V1
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "v1")]
    [Route("api/v{version:apiVersion}/Post/")]
    public class PostController : Controller
    {
        private readonly IPostRepository _postRepository;

        public PostController(
            IPostRepository postRepository,
            IUserService userService)
        {
            _postRepository = postRepository;
        }

        [HttpGet("")]
        public async Task<IActionResult> GetPosts()
        {
            var postList = await _postRepository.GetAllPost();
            return Ok(postList);
        }
        
        [HttpGet("{postId}")]
        public async Task<IActionResult> GetPost(int postId)
        {
            var post = await _postRepository.GetPost(postId);
            return Ok(post);
        }

        [HttpPost("SavePost")]
        public async Task<IActionResult> SavePost([FromBody] PostViewModel viewModel)
        {
            if (viewModel.Id.HasValue)
            {
                await _postRepository.EditPost(viewModel);
            }
            else
            {
                await _postRepository.SavePost(viewModel);
            }

            return Ok();
        }
    }
}