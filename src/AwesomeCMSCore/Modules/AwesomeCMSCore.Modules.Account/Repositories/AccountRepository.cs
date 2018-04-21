﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using AwesomeCMSCore.Modules.Account.ViewModels;
using AwesomeCMSCore.Modules.Entities.Data;
using AwesomeCMSCore.Modules.Entities.Entities;
using AwesomeCMSCore.Modules.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AwesomeCMSCore.Modules.Account.Repositories
{
    public class AccountRepository : IAccountRepository
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ApplicationDbContext _context;

        public AccountRepository(
            IMapper mapper,
            IUnitOfWork unitOfWork,
            ApplicationDbContext context)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _context = context;
        }

        public async Task<IEnumerable<UserViewModel>> UserList()
        {
            var userList = await (from user in _context.Users
                                  select new UserViewModel
                                  {
                                      UserId = user.Id,
                                      UserName = user.UserName,
                                      Email= user.Email,
                                      EmailConfirmed= user.EmailConfirmed.ToString() 
                                  }).ToListAsync();

            
            return userList;
        }

        public async Task AccountToggle(AccountToggleViewModel accountToggleVm)
        {
            var account = await _unitOfWork.Repository<User>().Query().Where(acc => acc.Id == accountToggleVm.AccountId).FirstOrDefaultAsync();
            if (account != null)
            {
                account.EmailConfirmed = accountToggleVm.ToogleFlag;
                await _unitOfWork.Repository<User>().UpdateAsync(account);
            }
        }
    }
}
